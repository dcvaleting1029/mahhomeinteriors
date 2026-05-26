import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import AccountLayout from "./pages/account/AccountLayout";
import Overview from "./pages/account/Overview";
import Orders from "./pages/account/Orders";
import OrderDetail from "./pages/account/OrderDetail";
import Wishlist from "./pages/account/Wishlist";
import Addresses from "./pages/account/Addresses";
import AccountDetails from "./pages/account/AccountDetails";

function App() {
    return (
        <AuthProvider>
            <WishlistProvider>
                <CartProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/product/:slug" element={<ProductDetail />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/payment/success" element={<PaymentSuccess />} />
                            <Route path="/payment/failed" element={<PaymentFailed />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            <Route path="/account" element={<AccountLayout />}>
                                <Route index element={<Overview />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="orders/:id" element={<OrderDetail />} />
                                <Route path="wishlist" element={<Wishlist />} />
                                <Route path="addresses" element={<Addresses />} />
                                <Route path="details" element={<AccountDetails />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <Toaster position="bottom-right" />
                    </BrowserRouter>
                </CartProvider>
            </WishlistProvider>
        </AuthProvider>
    );
}

export default App;
