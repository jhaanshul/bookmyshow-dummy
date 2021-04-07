import * as bluebirdPromise from 'bluebird';
import moviesDb from "../../utils/moviesDb";

export const getMoviesPlayingInCinemas = async ({ cinemaIds }) => {
    try {
        const sql = 'select distinct(movie_id) as movieId, mv.name as movieName, mv.language, cm.city_id as cityId, c.name as cityName ' +
            'from movie_showtimes ms join ' +
            'movies mv on mv.id = ms.movie_id ' +
            'join cinemas cm on cm.id = ms.cinema_id ' +
            'join cities c on c.id = cm.city_id ' +
            'where cinema_id in (?)';
        return await moviesDb.runQuery(sql, [cinemaIds]);
    } catch (err) {
        throw err;
    }
};

export const getMovieDetails = async (movieId) => {
    try {
        const sql = 'select id, name as movieName, language from movies where id = ?'
        return await moviesDb.runQuery(sql, [movieId]);
    } catch (err) {
        throw err;
    }
}

export const getGetMovieShowTimes = async ({ movieId, cityId }) => {
    try {
        const sql = 'select ms.id as showId, cm.name as cinemaName, mv.name as movieName, mv.language, start_time as startTime, ' +
            'end_time as endTime, available_seats as availableSeats, price as ticketPrice from movie_showtimes ms ' +
            'join movies mv on mv.id = ms.movie_id ' +
            'join cinemas cm on cm.id = ms.cinema_id ' +
            'where ms.movie_id = ? and cm.city_id = ?';
        return await moviesDb.runQuery(sql, [movieId, cityId]);
    } catch (err) {
        console.log({err});
        throw err;
    }
}

export const checkAvailabilityAndBookTicket = async ({ showId, userId, noOfTickets }) => {
    try {
        console.log('inside checkAvailabilityAndBookTicket:', { showId, userId, noOfTickets })
        const sql = 'select id, available_seats as availableSeats from movie_showtimes ms where ms.id = ?';
        const showDetails = await moviesDb.runQuery(sql, [showId]);
        if (!showDetails[0] || !showDetails[0].availableSeats || showDetails[0].availableSeats < noOfTickets) {
            throw new Error(JSON.stringify({
                message: 'Requested seats not available, Please try with a different show time',
                statusCode: 400
            }));
        }
        const conn = bluebirdPromise.promisifyAll(await moviesDb.getConnectionAsync());
        // start transaction
        await conn.beginTransactionAsync();
        try {
            await Promise.all([
                conn.queryAsync('insert into movie_bookings (show_id, user_id, no_of_tickets) values (?, ?, ?)', [showId, userId, noOfTickets]),
                conn.queryAsync('update movie_showtimes set available_seats = available_seats - ? where id = ?', [noOfTickets, showId]), // set session for co-host
            ]);
            await conn.commitAsync();
            conn.release();
        } catch (ex) {
            // rollback transaction and release
            await conn.rollbackAsync();
            conn.release();
            throw ex;
        }
    } catch (err) {
        console.log({err});
        throw err;
    }
};

export const getShowDetails = async ({showId}) => {
    try {
        const sql = 'select id as showId, available_seats as availableTickets from movie_showtimes where id = ?';
        return await moviesDb.runQuery(sql, [showId]);
    } catch (err) {
        throw err;
    }
}