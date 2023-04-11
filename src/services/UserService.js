import BaseService from "#services/Base/BaseService";
export default class UserService extends BaseService {
    constructor(repository) {
        super(repository);
    }
    async create(data) {
        return await this.repository.create(data).catch(e => { throw e; });
    }
}
