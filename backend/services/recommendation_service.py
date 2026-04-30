from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

def get_semantic_recommendations(target_product, all_products, limit=4):
    """
    Step 3: Embeddings + Vector Search (Advanced Layer)
    Uses TF-IDF to create 'semantic' vectors of products based on their 
    Title and Description, then finds the most semantically similar items.
    """
    if not all_products or len(all_products) <= 1:
        return []

    # 1. Prepare the text data (Title + Description)
    data = []
    for p in all_products:
        content = f"{p.name} {p.description or ''} {p.category}"
        data.append({
            "id": p.id,
            "content": content
        })
    
    df = pd.DataFrame(data)
    
    # 2. Vectorize the content (Convert text to numbers)
    # This is our 'Embedding' layer
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['content'])
    
    # 3. Find the index of the target product in the matrix
    try:
        target_idx = df[df['id'] == target_product.id].index[0]
    except IndexError:
        return []
    
    # 4. Calculate Cosine Similarity between target and all other products
    # This measures how 'close' the vectors are in semantic space
    cosine_sim = cosine_similarity(tfidf_matrix[target_idx], tfidf_matrix).flatten()
    
    # 5. Get top N similar products (excluding itself)
    similar_indices = cosine_sim.argsort()[::-1]
    
    # Filter out the target product and get top N
    results_pids = []
    for idx in similar_indices:
        pid = int(df.iloc[idx]['id'])
        if pid != target_product.id:
            results_pids.append(pid)
        if len(results_pids) >= limit:
            break
            
    # Map back to product objects
    products_map = {p.id: p for p in all_products}
    return [products_map[pid] for pid in results_pids if pid in products_map]
