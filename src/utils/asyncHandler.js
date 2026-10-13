const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// Also we can write this function using try-catch

// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(res, req, next);
//     } catch(err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message,
//         })
//     }
// }
