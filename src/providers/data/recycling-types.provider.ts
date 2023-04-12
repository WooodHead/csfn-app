import DataProvider from '@/providers/data/data.provider'

class RecyclingTypesProvider extends DataProvider {

  constructor() {
    super('/recycling-types')
  }

  findAll() {
    return this.http.get('/')
      .then(({data}) => data)
  }

}

export const recyclingTypesProvider = new RecyclingTypesProvider()