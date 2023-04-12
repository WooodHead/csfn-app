import {Action, Module, Mutation, VuexModule} from 'vuex-class-modules'
import {store} from '@/store/index'
import RecyclingStationModel from '@/types/RecyclingStationModel'
import RecyclingStation from '@/types/RecyclingStation'
import {recyclingStationModelsProvider} from '@/providers/data/recycling-station-models.provider'
import {recyclingStationsProvider} from '@/providers/data/recycling-stations.provider'
import {imagesProvider} from '@/providers/data/images.provider'

@Module
class GroupRecyclingModule extends VuexModule {

  constructor() {
    super({name: 'group-recycling', store})
  }

  private _currentGroupStationModels: RecyclingStationModel[] = []
  private _currentGroupStations: RecyclingStation[] = []


  get currentGroupStationModels(): RecyclingStationModel[] {
    return this._currentGroupStationModels
  }

  get currentGroupStations(): RecyclingStation[] {
    return this._currentGroupStations
  }

  @Mutation
  setCurrentGroupStationModels(value: RecyclingStationModel[]) {
    this._currentGroupStationModels = value
  }

  @Mutation
  setCurrentGroupStations(value: RecyclingStation[]) {
    this._currentGroupStations = value
  }

  @Action
  fetchCurrentGroupStationModels(groupId: number) {
    return recyclingStationModelsProvider.findForGroup(groupId)
      .then(models => this.setCurrentGroupStationModels(models))
  }

  @Action
  createStation(station: RecyclingStation) {
    return imagesProvider.uploadImages(station.pictures as File[], 'create-station')
      .then((images) => recyclingStationsProvider.create({...station, pictures: images}))
  }

  @Action
  fetchCurrentGroupStations(groupId: number) {
    return recyclingStationsProvider.findForGroup(groupId)
      .then(stations => this.setCurrentGroupStations(stations))
  }

  @Action
  updateStation({station, removedPictures}: { station: RecyclingStation, removedPictures: number[] }) {
    const picturesToUpload = station.pictures.filter(p => p instanceof Blob) as File[]
    return Promise.all(removedPictures.map((id) => imagesProvider.removeImage(id)))
      .then(() => picturesToUpload.length
        ? imagesProvider.uploadImages(picturesToUpload, 'update-station')
        : Promise.resolve([]))
      .then((images) => recyclingStationsProvider.update(station.id, {
        ...station,
        pictures: [...station.pictures.filter(p => !(p instanceof Blob)), ...images]
      }))
  }
}

export const groupRecyclingModule = new GroupRecyclingModule()