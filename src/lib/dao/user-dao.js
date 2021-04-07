import moviesDb from "../../utils/moviesDb";

export const getUserDetails = async ({username, password}) => {
    try {
        const sql = 'select id, name, mobile from users where username = ? and password = ?'
        const params = [username, password];
        const result = await moviesDb.runQuery(sql, params);
        return result && result.length ? result[0] : null;
    } catch (ex) {
        throw ex;
    }
};

export default getUserDetails;