import * as Joi from 'joi'
export const envSchema = Joi.object({
    PORT : Joi.string(),
    MONGO_URI : Joi.string().required()
})