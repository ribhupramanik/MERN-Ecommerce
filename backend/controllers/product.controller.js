import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js"

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({});
        res.json({products})
    } catch (error) {
        console.log("Error in getAllProducts Controller", error.message);
        res.status(500).json({success:false, message:"Server Error", error: error.message})

    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products")
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts))
        }
        featuredProducts = await Product.find({isFeatured:true}).lean()

        if(!featuredProducts){
            return res.status(404).json({message: "no featured products found"})
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts))

        res.json(featuredProducts)
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message)
        res.status(500).json({message: "Server error", error: error.message})
    }
}