import { getShowDetails } from '../dao/movies-dao';
export const validateTicketBookingParams = async (requestBody) => {
    console.log({requestBody})
    if (!requestBody.showId) {
        throw new Error(JSON.stringify({
            message: 'Please provide a show id to book',
            statusCode: 400
        }))
    }
    if (!requestBody.noOfTickets) {
        throw new Error(JSON.stringify({
            message: 'Please provide number of tickets',
            statusCode: 400
        }))
    };
    if (parseInt(requestBody.noOfTickets, 10) <= 0) {
        throw new Error(JSON.stringify({
            message: 'Invalid number of tickets',
            statusCode: 400
        }))
    }
    const showDetails = await getShowDetails({ showId: parseInt(requestBody.showId, 10) });
    if (!showDetails || !showDetails[0]) {
        throw new Error(
            JSON.stringify({
                message: "Invalid Show id",
                statusCode: 400,
            })
        );
    };
};

export default validateTicketBookingParams;