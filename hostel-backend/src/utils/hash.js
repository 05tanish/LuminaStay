import bcrypt from 'bcrypt'

export const hash_password = (password)=>{
    return bcrypt.hash(password, 10 )
}
export const compare_password = (password , hash)=>{
 return bcrypt.compare(password, hash)
}