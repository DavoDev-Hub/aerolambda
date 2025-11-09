import jwt, { SignOptions } from "jsonwebtoken"; // si usas esModuleInterop
// o: import * as jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  rol: "cliente" | "admin";
}

export const generarToken = (payload: TokenPayload): string => {
  const secret: jwt.Secret = process.env.JWT_SECRET ?? "secreto_por_defecto";

  const options: SignOptions = {
    expiresIn: "1h",
  };

  return jwt.sign(
    { id: payload.id, email: payload.email, rol: payload.rol },
    secret,
    options
  );
};

export const verificarToken = (token: string): TokenPayload => {
  const secret: jwt.Secret = process.env.JWT_SECRET ?? "secreto_por_defecto";
  return jwt.verify(token, secret) as TokenPayload;
};
