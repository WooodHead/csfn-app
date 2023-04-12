import DataProvider from '@/providers/data/data.provider'
import RecyclingStation from '@/types/RecyclingStation'
import UnknownError from '@/types/errors/UnknownError'
import {PaginatedResult} from '@/types/PaginatedResult'
import {StationUser} from '@/types/StationUser'

class RecyclingStationsProvider extends DataProvider {

  constructor() {
    super('/recycling-stations')
  }

  create(station: RecyclingStation) {
    return this.http.post('/', station)
      .catch(() => Promise.reject(new UnknownError('create-the-station')))
  }

  findForGroup(ownerId: number) {
    return this.http.get('/', {ownerId})
      .then(({data}) => data)
  }

  findInBounds(bounds: string) {
    return this.http.get('/', {bounds})
      .then(({data}) => data)
  }

  findOne(id: number) {
    return this.http.get('/' + id)
      .then(({data}) => data)
  }

  update(id: number, station: RecyclingStation) {
    return this.http.put('/' + id, station)
      .catch(() => Promise.reject(new UnknownError('update-the-station')))
  }

  remove(id: number) {
    return this.http.delete('/' + id)
      .catch(() => Promise.reject(new UnknownError('remove-the-station')))
  }

  findUsers(id: number, page: number): Promise<PaginatedResult<StationUser>> {
    return this.http.get(`/${id}/users`, {page})
      .then(({data}) => data)
  }
}

export const recyclingStationsProvider = new RecyclingStationsProvider()