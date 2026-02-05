import React from 'react'
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryPage = () => {
  const { fetchProductsByCategory, products } = useProductStore();

	const { category } = useParams();

	useEffect(() => {
		fetchProductsByCategory(category);
	}, [fetchProductsByCategory, category]);

  console.log("products:", products);
  
  return (
    <div>CategoryPage</div>
  )
}

export default CategoryPage