import { Lucia, User, Session } from "lucia";
import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { Lichess } from "arctic";
import { cache } from 'react';
import { cookies } from 'next/headers';
import { BASE_URL } from "@/config/base-url";
import mongoose from "mongoose";
import { dbConnect } from "./db";

const adapter = new MongodbAdapter(
	mongoose.connection.collection("sessions"),
	mongoose.connection.collection("users")
);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production",
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
})

export const validateRequest = cache(
	async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
		await dbConnect();
		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null
			};
		}

		const result = await lucia.validateSession(sessionId);
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result.session && result.session.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch { }
		return result;
	}
);

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
}

export const lichess = new Lichess(
	process.env.LICHESS_CLIENT_ID!,
	`${BASE_URL}/login/lichess/callback`,
);