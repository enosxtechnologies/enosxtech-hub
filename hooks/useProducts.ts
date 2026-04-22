import { useState, useEffect, useRef } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    // Add other product properties as needed
}

export const useProducts = (filters: Record<string, any>, pagination: { page: number; limit: number }, searchTerm: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const cacheRef = useRef<{ [key: string]: Product[] }>({});

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        const cacheKey = JSON.stringify({ filters, pagination, searchTerm });
        
        if (cacheRef.current[cacheKey]) {
            setProducts(cacheRef.current[cacheKey]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&page=${pagination.page}&limit=${pagination.limit}&filters=${JSON.stringify(filters)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
            cacheRef.current[cacheKey] = data; // Cache the fetched data
        } catch (err) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters, pagination, searchTerm]);

    return { products, loading, error };
};
