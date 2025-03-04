

async function isValidPassword(password: string, hashedPassword: string) {
    // console.log(await hashPassword(password), hashedPassword);
    return await hashPassword(password) === hashedPassword;
}

async function hashPassword(password: string) {
    const arrayBuffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(password));
    return Buffer.from(arrayBuffer).toString("base64");
}

export { isValidPassword, hashPassword };
