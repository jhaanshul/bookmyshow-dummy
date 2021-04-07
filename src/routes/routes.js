import config from "config";
const logger = require("../utils/logger");
//import broadcastDb from '../utils/broadcastDb';
import { searchCity, getCinemasInTheCity, getCityDetails } from '../lib/dao/cities-dao';
import { getMoviesPlayingInCinemas, getMovieDetails, 
    getGetMovieShowTimes, checkAvailabilityAndBookTicket, getShowDetails } from '../lib/dao/movies-dao';
import validateTicketBookingParams from "../lib/models/tickets";

export default function routes(app) {
    app.get("/", async (req, res) => res.status(200).send().end());

    app.get("/searchCity", async (req, res, next) => {
        try {
            if (!req.query.cityName) {
                throw new Error(
                    JSON.stringify({
                        message: "Please provide the city name",
                        statusCode: 400,
                    })
                );
            }
            const result = await searchCity({cityName: req.query.cityName});
            if (result) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send('Not Found');
            }
        } catch (err) {
            return next(err);
        }
    }) 

    app.get("/moviesInYouCity", async (req, res, next) => {
        try {
            if (!req.query.cityId && !req.query.cityName) {
                throw new Error(
                    JSON.stringify({
                        message: "Please provide the city name/id",
                        statusCode: 400,
                    })
                );
            };
            const cityId = req.query.cityId;
            const cityName = req.query.cityName;
            const allCinemasInCity = await getCinemasInTheCity({cityName, cityId});
            if (!allCinemasInCity || !allCinemasInCity.length) {
                throw new Error(
                    JSON.stringify({
                        message:
                            "Sorry, We are not currently serving in your city, please try with a alternate city",
                        statusCode: 400,
                    })
                );
            }
            const allMovies = await getMoviesPlayingInCinemas({ cinemaIds: 
                allCinemasInCity.map((element) => element.id)
            });
            return res.status(200).send(allMovies);
        } catch (err) {
            return next(err);
        }
    });
    // requires a movie id and a city
    app.get("/showTimes", async (req, res, next) => {
        try {
            if (!req.query.movieId || !req.query.cityId) {
                throw new Error(
                    JSON.stringify({
                        message: "MovieId and cityId are required parameters",
                        statusCode: 400,
                    })
                );
            }
            const movieDetails = await getMovieDetails(req.query.movieId);
            if (!movieDetails || !movieDetails[0]) {
                throw new Error(
                    JSON.stringify({
                        message: "Invalid Movie id",
                        statusCode: 400,
                    })
                );
            }
            const cityDetails = await getCityDetails(req.query.cityId);
            if (!cityDetails || !cityDetails[0]) {
                throw new Error(
                    JSON.stringify({
                        message: "Invalid city Id",
                        statusCode: 400,
                    })
                );
            }
            const result = await getGetMovieShowTimes({
                movieId: req.query.movieId,
                cityId: req.query.cityId,
            });
            return res.status(200).send(result);
        } catch (err) {
            return next(err);
        }
    });

    app.get("/ticketAvailability", async (req, res, next) => {
        try {
            if (!req.query.showId) {
                throw new Error(
                    JSON.stringify({
                        message: "showId is a required parameters",
                        statusCode: 400,
                    })
                );
            }
            const movieDetails = await getShowDetails({showId: req.query.showId});
            if (!movieDetails || !movieDetails[0]) {
                throw new Error(
                    JSON.stringify({
                        message: "Invalid Show id",
                        statusCode: 400,
                    })
                );
            };
            return res.status(200).send(movieDetails[0]);
        } catch (err) {
            return next(err);
        }
    });    

    app.post("/bookTicket", async (req, res, next) => {
        try {
            if (!req.user || !req.userId) {
                throw new Error(JSON.stringify({
                    message: 'Please login to book a ticket',
                    statusCode: 426
                }));
            };
            await validateTicketBookingParams(req.body);
            await checkAvailabilityAndBookTicket({showId: parseInt(req.body.showId, 10), userId: req.user.id, noOfTickets: parseInt(req.body.noOfTickets, 10)});
            return res.status(200).send('Tickets Booked! Enjoy your show!!');
        } catch (err) {
            return next(err);
        }
    });
}
