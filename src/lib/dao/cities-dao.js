import moviesDb from "../../utils/moviesDb";

export const searchCity = async ({cityName}) => {
    try {
        console.log({cityName});
        const sql = 'select id, name from cities where name like ?';
        return await moviesDb.runQuery(sql, [`%${cityName}%`]);
    } catch (err) {
        throw err;
    }
};

export const getCinemasInTheCity = async ({cityId, cityName}) => {
    try {
        let sql;
        let params;
        if (cityId) {
            sql = 'select id, name, city_id from cinemas where city_id = ?';
            params = [cityId]
        } else if (cityName) {
            sql = 'select cm.id, name, city_id from cinemas cm join cities c on c.id = cm.city_id ' +
            'where c.name = ?';
            params = [cityName]
        }
        return await moviesDb.runQuery(sql, params);
    } catch (err) {
        throw err;
    }
};

export const getCityDetails = async (cityId) => {
    try {
        const sql = 'select id, name as cityName from cities where id = ?';
        return await moviesDb.runQuery(sql, [cityId]);
    } catch (err) {
        throw err;
    }
}