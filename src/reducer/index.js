import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice"
import profileSlice from "../slices/profileSlice";
import cartSlice from "../slices/cartSlice";
import courseReducer from "../slices/courseSlice"

const rootReducer = combineReducers({
    auth: authReducer,
    profile: profileSlice,
    cart: cartSlice,
    course:courseReducer,

})

export default rootReducer