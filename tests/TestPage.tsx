import { useAuthStatus } from "./useAuthStatus";
import { CSSProperties } from "react";
import * as React from "react";

export const TestPage = () => {
	const [isLoggedIn, setIsLoggedIn] = useAuthStatus();

	const storeRedirectUrl = async () => {
		const response = await fetch("/set-redirect-url", { method: "POST" });
		if (!response.ok) {
			console.error("Failed to store redirect URL");
		} else {
			console.log("Redirect URL stored", response);
		}
	};

	const handleGoogleLogin = async () => {
		await storeRedirectUrl();
		window.location.href = "/auth/google";
	};

	const handleLogout = async () => {
		const response = await fetch("/logout", { method: "POST" });
		if (response.ok) {
			console.log("Logged out: ", response);
			setIsLoggedIn(false);
		} else {
			console.error("Logout failed");
		}
	};

	const handleRevokeToken = async () => {
		const response = await fetch("/revoke-token", { method: "POST" });
		if (response.ok) {
			console.log("Token revoked: ", response);
			setIsLoggedIn(false);
		} else {
			console.error("Failed to revoke token");
		}
	};

	const bodyStyle: CSSProperties = {
		fontFamily: "Arial, sans-serif",
		backgroundColor: "#f5f5f5",
		color: "#333",
		height: "100vh",
		margin: 0,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		overflowX: "hidden"
	};

	const headingStyle: CSSProperties = {
		fontSize: "2rem",
		marginBottom: "20px"
	};

	const paragraphStyle: CSSProperties = {
		fontSize: "1.2rem",
		marginBottom: "20px"
	};

	const navStyle: CSSProperties = {
		display: "flex",
		gap: "10px"
	};

	const buttonStyle: CSSProperties = {
		padding: "10px 20px",
		fontSize: "1rem",
		backgroundColor: "#007bff",
		color: "#fff",
		border: "none",
		borderRadius: "5px",
		cursor: "pointer"
	};

	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<title>Elysia Oauth2 Test</title>
				<meta name="description" content="Bun, Elysia & React" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.ico" />
			</head>
			<body style={bodyStyle}>
				<h1 style={headingStyle}>TestPage</h1>
				<p style={paragraphStyle}>
					{isLoggedIn ? "You are logged in" : "You are not logged in"}
				</p>
				<nav style={navStyle}>
					<button
						onClick={() => handleGoogleLogin()}
						style={buttonStyle}
					>
						Login
					</button>
					<button onClick={() => handleLogout()} style={buttonStyle}>
						Logout
					</button>
					<button
						onClick={() => handleRevokeToken()}
						style={buttonStyle}
					>
						Revoke token
					</button>
				</nav>
			</body>
		</html>
	);
};
