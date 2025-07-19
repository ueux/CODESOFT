import { create } from "zustand";
import {persist} from "zustand/middleware"
import { sendKafkaEvent } from "../actions/track-user";

type Product = { id: string;
    title: string;
    price: number;
    image: string;
    quantity?: number;
    shopId:string
}
type Store = { cart: Product[];
    wishlist: Product[];
    addToCart: (product: Product,
        user: any,
        location: any,
        deviceInfo: any
    )=>void;
    removeFromCart: (id: string,
        user: any,
        location: any,
        deviceInfo: any
    )=>void;
    addToWishlist: (product: Product,
        user: any,
        location: any,
        deviceInfo: any
    )=>void;
    removeFromWishlist: (id: string,
        user: any,
        location: any,
        deviceInfo: any
    )=>void;
}

export const useStore = create<Store>()(persist((set, get) => ({
    cart: [], wishlist: [],
    addToCart: (product, {user}, location, deviceInfo) => {
        set((state) => {
            const existing = state.cart?.find((item) => item.id === product.id)
            if (existing) {
                return { cart: state.cart.map((item) => item.id === product.id ? { ...item,user,location, deviceInfo,
                quantity: (item.quantity ?? 1) + (product.quantity ?? 1),} :item)}
            }
            return {cart:[...state.cart,{...product,quantity:product.quantity,user,location, deviceInfo}]}
        })
        if (user?.id && location && deviceInfo) {
            console.log("hi")
            sendKafkaEvent({
                userId: user?.id,
                productId: product?.id,
                shopId: product?.shopId,
                action: "add_to_cart",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device:deviceInfo||"Unknown Device"
            })
        }
    },
    removeFromCart: (id, {user}, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => item.id === id)
        set((state) => ({
            cart:state.cart?.filter((item)=>item.id!==id)
        }))
        if (user?.id && location && deviceInfo && removeProduct) {
            sendKafkaEvent({
                userId: user?.id,
                productId: removeProduct?.id,
                shopId: removeProduct?.shopId,
                action: "remove_from_cart",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device:deviceInfo||"Unknown Device"
            })
        }
    },
    addToWishlist:(product ,{user},location,deviceInfo) => {
        set((state) => {
            const existing = state.wishlist?.find((item) => item.id === product.id)
            if (existing) {
                return state
            }
            return {wishlist:[...state.wishlist,product]}
        })
        if (user?.id && location && deviceInfo) {
            sendKafkaEvent({
                userId: user?.id,
                productId: product?.id,
                shopId: product?.shopId,
                action: "add_to_wishlist",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device:deviceInfo||"Unknown Device"
            })
        }
    },
    removeFromWishlist: (id, {user}, location, deviceInfo) => {
        const removeWishlist = get().wishlist.find((item) => item.id === id)
        set((state) => ({
            wishlist:state.wishlist?.filter((item)=>item.id!==id)
        }))
        if (user?.id && location && deviceInfo &&  removeWishlist) {
            sendKafkaEvent({
                userId: user?.id,
                productId: removeWishlist?.id,
                shopId: removeWishlist?.shopId,
                action: "remove_from_wishlist",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device:deviceInfo||"Unknown Device"
            })
        }
    }
}),{name:"store-storage"}
))