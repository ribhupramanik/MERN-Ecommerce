import Coupon from "../models/coupon.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const {products, couponCode} = req.body

    if(!Array.isArray(products) || products.length === 0){
      return res.status(400).jsonn({error: "Invalid or empty products array"})
    }

    let totalAmount = 0

    const lineItems = products.map(product => {
      const amount = Math.round(product.price * 100)
      totalAmount += amount * product.quantity
      return {
        price_data: {
          currency:"inr",
          product_data:{
            name:product.name,
            images:[product.image],
          },
          unit_amount:amount
        }
      }
    });

    let coupon = null

    if(couponCode){
      coupon = await Coupon.findOne({code:couponCode, userId:req.user._id, isActive:true})
      if(coupon){
        totalAmount -= Math.round(totalAmount * coupon.discountPercentage/100)
      }
    }

    const session = await stripe.checkout.session.create({
      paymennt_method_types:["card"],
      line_items: lineItems,
      mode:"payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon?[
        {
          coupon: await createStripeCoupon(coupon.discountPercentage),
        },
      ]: [],
      metadata:{
        userId:req.user._id.toString(),
        couponCode:couponCode || ""
      }
    })

  } catch (error) {
    
  }
}

async function createStripeCoupon(discountPercentage){
  const coupon = await stripe.coupons.create({
    percennt_off: discountPercentage,
    duration: "once",
  })
  return coupon.id
}

