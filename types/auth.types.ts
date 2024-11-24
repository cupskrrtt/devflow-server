import { SignUpObject, SignInObject, RefreshObject } from "@/models/auth";

export type SignUpDto = typeof SignUpObject.static;
export type SignInDto = typeof SignInObject.static;
export type RefreshDto = typeof RefreshObject.static;
