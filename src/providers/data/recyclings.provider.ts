import DataProvider from '@/providers/data/data.provider'
import Recycling from '@/types/Recycling'
import UnknownError from '@/types/errors/UnknownError'
import {PaginatedResult} from '@/types/PaginatedResult'

class RecyclingsProvider extends DataProvider {

  constructor() {
    super('/recyclings')
  }

  create(recycling: Recycling) {
    return this.http.post('/', recycling)
      .catch(() => Promise.reject(new UnknownError('create-the-recycling')))
  }

  findOne(id: number) {
    return this.http.get('/' + id)
      .then(({data}) => data)
  }

  findAll({
            page,
            userId,
            groupId,
            stationId
          }: { page: number, userId?: number, groupId?: number, stationId?: number }): Promise<PaginatedResult<Recycling>> {
    return this.http.get('/', {page, userId, groupId, stationId})
      .then(({data}) => data)
  }

  update(id: number, recycling: Recycling) {
    return this.http.put('/' + id, recycling)
      .catch(() => Promise.reject(new UnknownError('update-the-recycling')))
  }

  remove(id: number) {
    return this.http.delete('/' + id)
      .catch(() => Promise.reject(new UnknownError('remove-the-recycling')))
  }

}

export const recyclingsProvider = new RecyclingsProvider()