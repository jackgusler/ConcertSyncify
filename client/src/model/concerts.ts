import axios from '../myAxios';

export const getConcerts = async () => {
    const response = await axios.get('/concerts')
    return response.data;
}

export const getConcertById = async (id: number) => {
    const response = await axios.get(`/concerts/${id}`)
    return response.data;
}