import { roles } from "../../middleware/auth.js";




export const endPoint = {
    createProduct: [roles.Admin],
    updateProduct: [roles.Admin],

}