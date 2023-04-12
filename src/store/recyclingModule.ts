import {Action, Module, Mutation, VuexModule} from 'vuex-class-modules'
import {store} from '@/store/index'
import RecyclingStation from '@/types/RecyclingStation'
import {recyclingStationsProvider} from '@/providers/data/recycling-stations.provider'
import Recycling from '@/types/Recycling'
import {recyclingsProvider} from '@/providers/data/recyclings.provider'
import {imagesProvider} from '@/providers/data/images.provider'

@Module
class RecyclingModule extends VuexModule {

  constructor() {
    super({name: 'recycling', store})
  }

  private _recycling: Recycling
  private _stations: RecyclingStation[]
  private _station: RecyclingStation

  get recycling(): Recycling {
    return this._recycling
  }

  get stations(): RecyclingStation[] {
    return this._stations
  }

  get station(): RecyclingStation {
    return this._station
  }

  @Mutation
  setRecycling(value: Recycling) {
    this._recycling = value
  }

  @Mutation
  setStations(value: RecyclingStation[]) {
    this._stations = value
  }

  @Mutation
  setStation(value: RecyclingStation) {
    this._station = value
  }

  @Action
  fetchRecycling(id: number) {
    return recyclingsProvider.findOne(id)
      .then(recycling => this.setRecycling(recycling))
  }

  @Action
  fetchStations(bounds: string) {
    return recyclingStationsProvider.findInBounds(bounds)
      .then(stations => this.setStations(stations))
  }

  @Action
  fetchStation(id: number) {
    return recyclingStationsProvider.findOne(id)
      .then(station => this.setStation(station))
  }

  @Action
  createRecycling(recycling: Recycling) {
    return imagesProvider.uploadImages(recycling.pictures as File[], 'create-station')
      .then((images) => recyclingsProvider.create({...recycling, pictures: images}))
  }

  @Action
  updateRecycling({recycling, removedPictures}: { recycling: Recycling, removedPictures: number[] }) {
    const picturesToUpload = recycling.pictures.filter(p => p instanceof Blob) as File[]
    return Promise.all(removedPictures.map((id) => imagesProvider.removeImage(id)))
      .then(() => picturesToUpload.length
        ? imagesProvider.uploadImages(picturesToUpload, 'update-station')
        : Promise.resolve([]))
      .then((images) => recyclingsProvider.update(recycling.id, {
        ...recycling,
        pictures: [...recycling.pictures.filter(p => !(p instanceof Blob)), ...images]
      }))
  }

}

export const recyclingModule = new RecyclingModule()

