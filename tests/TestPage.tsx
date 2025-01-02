import type { CSSProperties } from "react";
import * as React from "react";
import { useAuthStatus } from "./useAuthStatus";

export const TestPage = () => {
	const { isLoggedIn, setIsLoggedIn, userIdentity, setUserIdentity } =
		useAuthStatus();

	const storeRedirectUrl = async () => {
		const response = await fetch("/set-redirect-url", { method: "PUT" });
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
			setUserIdentity(null);
		} else {
			console.error("Logout failed");
		}
	};

	const handleRevokeRefreshToken = async () => {
		const response = await fetch("/revoke-refresh-token", {
			method: "PUT",
		});
		if (response.ok) {
			console.log("Refresh token revoked: ", response);
			setIsLoggedIn(false);
		} else {
			console.error("Failed to revoke refresh token");
		}
	};

	const handleRevokeAccessToken = async () => {
		const response = await fetch("/revoke-access-token", {
			method: "PUT",
		});
		if (response.ok) {
			console.log("Access token revoked: ", response);
			setIsLoggedIn(false);
		} else {
			console.error("Failed to revoke access token");
		}
	};

	const handleRefreshAccessToken = async () => {
		const response = await fetch("/refresh-access-token", {
			method: "PUT",
		});
		if (response.ok) {
			console.log("Token refreshed: ", response);
		} else {
			console.error("Failed to refresh token");
		}
	};

	const bodyStyle: CSSProperties = {
		fontFamily: "Roboto, sans-serif",
		display: "flex",
		flexDirection: "column",
		placeItems: "center",
		width: "100%",
		backgroundColor: "#fff",
		color: "#333",
		overflowX: "hidden",
	};

	const headerStyle: CSSProperties = {
		width: "100%",
		padding: "20px",
		backgroundColor: "#007bff",
		color: "#fff",
		textAlign: "center",
	};

	const mainStyle: CSSProperties = {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: "20px",
	};

	const headingStyle: CSSProperties = {
		fontSize: "2rem",
		marginBottom: "20px",
	};

	const paragraphStyle: CSSProperties = {
		fontSize: "1.2rem",
		marginBottom: "20px",
		textAlign: "center",
	};

	const navStyle: CSSProperties = {
		display: "flex",
		gap: "10px",
		flexWrap: "wrap",
		justifyContent: "center",
	};

	const buttonStyle: CSSProperties = {
		padding: "10px 20px",
		fontSize: "1rem",
		backgroundColor: "#007bff",
		color: "#fff",
		border: "none",
		borderRadius: "5px",
		cursor: "pointer",
	};

	const linkStyle: CSSProperties = {
		textDecoration: "none",
		color: "#fff",
	};
	return (
		<html
			lang="en"
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			<head>
				<meta charSet="utf-8" />
				<title>Elysia Oauth2 Test</title>
				<meta name="description" content="Bun, Elysia & React" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="https://reactjs.org/favicon.ico" />
				<style>{`
   						 * {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
							font-weight: inherit;
							font-style: inherit;
							font-family: inherit;
							color: inherit;
							overflow-x: hidden;
						}
					`}</style>
			</head>
			<body style={bodyStyle}>
				<header style={headerStyle}>
					<h1 style={headingStyle}>Elysia Oauth2 Test</h1>
					<nav style={navStyle}>
						<a href="/" style={linkStyle}>
							Home
						</a>
						<a href="/test-page-1" style={linkStyle}>
							Test Page 1
						</a>
						<a href="/test-page-2" style={linkStyle}>
							Test Page 2
						</a>
					</nav>
				</header>
				<main style={mainStyle}>
					{isLoggedIn && userIdentity ? (
						<div
							style={{
								textAlign: "center",
								marginBottom: "20px",
							}}
						>
							<img
								src={userIdentity.picture}
								// biome-ignore lint/a11y/noRedundantAlt: <explanation>
								alt="Profile Picture"
								style={{
									width: "100px",
									height: "100px",
									objectFit: "cover",
									borderRadius: "50%",
									border: "none",
								}}
							/>
							<h2 style={headingStyle}>Welcome {userIdentity.name}</h2>
							<h3 style={headingStyle}>User Info</h3>
							<p style={paragraphStyle}>
								<strong>Id:</strong> {userIdentity.id}
							</p>
							<p style={paragraphStyle}>
								<strong>Email:</strong> {userIdentity.email}
							</p>
							<p style={paragraphStyle}>
								<strong>Verified Email:</strong>{" "}
								{userIdentity.verifiedEmail ? "Yes" : "No"}
							</p>
							<p style={paragraphStyle}>
								<strong>Name:</strong> {userIdentity.name}
							</p>
							<p style={paragraphStyle}>
								<strong>Given Name:</strong> {userIdentity.givenName}
							</p>
							<p style={paragraphStyle}>
								<strong>Family Name:</strong> {userIdentity.familyName}
							</p>
							<p style={paragraphStyle}>
								<strong>Picture:</strong>
								{userIdentity.picture}
							</p>
						</div>
					) : (
						<div
							style={{
								textAlign: "center",
								marginBottom: "20px",
							}}
						>
							<h2 style={headingStyle}>User not logged in</h2>
							<p style={paragraphStyle}>
								Use the buttons to test the plugin's features
							</p>
						</div>
					)}
					<nav style={navStyle}>
						<button
							type="button"
							onClick={() => handleGoogleLogin()}
							style={buttonStyle}
						>
							Login
						</button>
						<button
							type="button"
							onClick={() => handleLogout()}
							style={buttonStyle}
						>
							Logout
						</button>
						<button
							type="button"
							onClick={() => handleRefreshAccessToken()}
							style={buttonStyle}
						>
							Refresh access token
						</button>
						<button
							type="button"
							onClick={() => handleRevokeRefreshToken()}
							style={buttonStyle}
						>
							Revoke refresh token
						</button>
						<button
							type="button"
							onClick={() => handleRevokeAccessToken()}
							style={buttonStyle}
						>
							Revoke access token
						</button>
					</nav>
				</main>
			</body>
		</html>
	);
};
