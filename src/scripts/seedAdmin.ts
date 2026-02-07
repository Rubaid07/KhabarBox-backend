import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
    try{
        const adminData = {
            name: "Admin",
            email: "admin1@khabarbox.com",
            role: UserRole.ADMIN,
            password: "admin1234"
        }
        // check user exist on db or not
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });
        if(existingUser){
            throw new Error("User already exists!");
        }

        const signUpAdmin = await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": `${process.env.APP_URL}`,
            },
            body: JSON.stringify(adminData)
        })

        if(signUpAdmin.ok){
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
        }
        console.log(signUpAdmin);

    }catch(error){
        console.error(error);
    }
}

seedAdmin()