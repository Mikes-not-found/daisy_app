import { account } from "../App";

export async function loginAndGetJWT(email: string, password: string): Promise<string | void> {
        console.log('Prima di entrare');
        await account.createEmailPasswordSession(email, password);
        console.log('Sessione creata con successo');

        const jwtResponse = await account.createJWT();
        console.log('JWT Token:', jwtResponse.jwt);
        return jwtResponse.jwt;
}