import DataProvider from '@/providers/data/data.provider'
import RecyclingStationModel from '@/types/RecyclingStationModel'
import {handleBackError} from '@/tools/handleBackError'

class RecyclingStationModelsProvider extends DataProvider {

  constructor() {
    super('/recycling-station-models')
  }

  create(model: RecyclingStationModel) {
    return this.http.post('/', model)
      .catch(handleBackError('create-the-station-model'))
  }

  findForGroup(manufacturerId: number): Promise<RecyclingStationModel[]> {
    return this.http.get('/', {manufacturerId})
      .then(({data}) => data)
  }

  findOne(id: number): Promise<RecyclingStationModel> {
    return this.http.get('/' + id)
      .then(({data}) => data)
  }

  update(model: RecyclingStationModel) {
    return this.http.put('/' + model.id, model)
      .catch(handleBackError('update-the-station-model'))
  }

  remove(id) {
    return this.http.delete('/' + id)
      .catch(handleBackError('remove-the-station-model'))
  }
}

export const recyclingStationModelsProvider = new RecyclingStationModelsProvider()
