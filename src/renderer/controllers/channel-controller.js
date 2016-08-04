const request = require('request')

module.exports = class ChannelController {
  constructor (state) {
    this.state = state
  }

  init (torrentList) {
    this.torrentList = torrentList
    console.log('--- TORRENT LIST:', this.torrentList)

    // var torrents = this.getTorrentsFromEnabledChannels()
    // console.log('-- GOT TORRENTS from ENABLED CHANNELS:', torrents)
    // if (!torrents.length) return
    // this.state.saved.torrentsFromEnabledChannels = torrents
  }

  getChannels () {
    return this.state.saved.prefs.channels || {}
  }

  getEnabledChannels () {
    return this.state.saved.prefs.enabledChannels || {}
  }

  /**
   * Makes GET request to get channel data.
   *
   * @param  {string} channelUrl
   * @param {function} callback
   */
  getChannel (channelUrl, successCallback, errorCallback) {
    request
      .get(channelUrl)
      .on('response', onResponse)

    function onResponse (response) {
      var body = ''
      response.on('data', function (chunk) {
        body += chunk
      })

      response.on('end', function () {
        var json = JSON.parse(body)
        if (response.statusCode === 200) return successCallback(json, channelUrl)
        return errorCallback(json, channelUrl)
      })
    }
  }

  channelExists (channelUrl) {
    var channels = this.getChannels()
    if (channels[channelUrl]) return true
    return false
  }

  addChannel (channelUrl) {
    var that = this
    console.log('--- ADD CHANNEL: URL:', channelUrl)
    if (this.channelExists(channelUrl)) {
      console.log('-- channel already exists:', channelUrl)
      return false
    }
    this.getChannel(channelUrl, onGetChannelOk, onGetChannelError)

    function onGetChannelOk (response) {
      response.url = channelUrl
      console.log('--- onGetChannelOk:', response)
      that.state.unsaved.prefs.channels = that.state.unsaved.prefs.channels || {}
      that.state.unsaved.prefs.channels[channelUrl] = response
    }

    function onGetChannelError (response) {
      console.log('--- onGetChannelError:', response)
    }
  }
}
