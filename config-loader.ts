export const configLoader = ()=>{
    return {
        port: process.env.PORT,
        database:{
            username:process.env.DATABASE_USERNAME,
            password:process.env.DATABASE_PASSWORD
        },
        mongo:{
            uri:process.env.MONGO_URI
        },
        jwt:process.env.JWT_SECRET
    }
}