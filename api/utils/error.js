export const errorHandler=(statusCode,messsage)=>{
    const error = new Error();
    error.statusCode=statusCode;
    error.message=messsage;
    throw error;

} 