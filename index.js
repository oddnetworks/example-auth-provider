const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Mock DB of user records
const DB = [
	{id: 1, email: 'user1@example.com', password: 'pass12345', entitlements: ['free']},
	{id: 2, email: 'user2@example.com', password: 'pass12345', entitlements: ['annually']},
	{id: 3, email: 'user3@example.com', password: 'pass12345', entitlements: ['monthly', 'trial']}
];

app.use(bodyParser.json());

app.post('/login', (req, res) => {
	const payload = req.body.data;

	try {
		// Verify the payload type is authentication, if not then fail
		if (payload.type === 'authentication') {

			// Look up the user in the DB
			const user = _.find(DB, {email: payload.attributes.email});

			// If a user is found AND the passwords match then respond with a HTTP 200 with a viewer
			if (user && user.password === payload.attributes.password) {

				// Create and sign a JWT for future logins from a server on behalf of this user
				const token = jwt.sign({
					iss: 'example.com',
					sub: user.id
				},
				'secret',
				{
					expiresIn: '5 days'
				});

				res.status(200).send({
					data: {
						id: user.id,
						type: 'viewer',
						attributes: {
							email: user.email,
							entitlements: user.entitlements
						},
						meta: {
							jwt: token
						}
					}
				});
			} else {
				res.status(403).send('login failed');
			}
		} else {
			res.status(400).send('type is not authentication')
		}
	} catch (err) {
		res.status(500).send(err.message);
	}
});

app.post('/verify', (req, res) => {
	const payload = req.body.data;

	try {
		// Verify the payload type is authorization, if not then fail
		if (payload.type === 'authorization') {

			// If the payload does not have a JWT then fail it
			if (payload.attributes.jwt && payload.attributes.jwt !== '') {
				try {
					// Verify the JWT sent, if not verified then fail it
					const decoded = jwt.verify(payload.attributes.jwt, 'secret');

					// If valid JWT look up the user in the DB based on the jwt.sub and respond with a HTTP 200 with a viewer
					const user = _.find(DB, {id: decoded.sub});

					// Create and sign a new JWT with an updated expiration date
					const token = jwt.sign({
						iss: 'example.com',
						sub: user.id
					},
					'secret',
					{
						expiresIn: '5 days'
					});

					res.status(200).send({
						data: {
							id: user.id,
							type: 'viewer',
							attributes: {
								email: user.email,
								entitlements: user.entitlements
							},
							meta: {
								jwt: token
							}
						}
					});
				} catch (err) {
					res.status(403).send('verification failed');
				}
			} else {
				res.status(403).send('verification failed');
			}
		} else {
			res.status(400).send('type is not authorization')
		}
	} catch (err) {
		res.status(500).send(err.message);
	}
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`);
})
