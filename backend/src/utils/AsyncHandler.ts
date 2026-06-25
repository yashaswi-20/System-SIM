import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler<P =any>= (
  req: Request<P>,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export const asyncHandler = <P=any>(reqHandler: AsyncRequestHandler<P>) => {
  return (req: Request<P>, res: Response, next: NextFunction) => {
    Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
  };
};

