/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @flow
 */
'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
  ActivityIndicator,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
} = ReactNative;
var TimerMixin = require('react-timer-mixin');

var invariant = require('fbjs/lib/invariant');
var dismissKeyboard = require('dismissKeyboard');

var MovieCell = require('./MovieCell');
var MovieScreen = require('./MovieScreen');
var SearchBar = require('SearchBar');

/**
 * This is for demo purposes only, and rate limited.
 * In case you want to use the Rotten Tomatoes' API on a real app you should
 * create an account at http://developer.rottentomatoes.com/
 */
var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/';
var API_KEYS = [
  //'7waqfqbprs7pajbz28mqf6vz',
  'y4vwv8m33hed9ety83jmv52f', // Fallback api_key
];

// Results should be cached keyed by the query
// with values of null meaning "being fetched"
// and anything besides null and undefined
// as the result of a valid query
var resultsCache = {
  dataForQuery: {},
  nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};

var SearchScreen = React.createClass({
  mixins: [TimerMixin],

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: '',
      queryNumber: 0,
    };
  },

  componentDidMount: function() {
    this.searchMovies('');
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
    if (query) {
      return (
        API_URL + 'movies.json?apikey=' + apiKey + '&q=' +
        encodeURIComponent(query) + '&page_limit=20&page=' + pageNumber
      );
    } else {
      // With no query, load latest movies
      return (
        API_URL + 'lists/movies/in_theaters.json?apikey=' + apiKey +
        '&page_limit=20&page=' + pageNumber
      );
    }
  },

  searchMovies: function(query: string) {
    this.timeoutID = null;

    this.setState({filter: query});

    var cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.setState({
          dataSource: this.getDataSource(cachedResultsForQuery),
          isLoading: false
        });
      } else {
        this.setState({isLoading: true});
      }
      return;
    }

    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      isLoading: true,
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
    });
    this.setState({
      isLoading: false,
      dataSource: this.getDataSource([
        {
            "title": "Jack and Jill",
            "year": 2011,
            "runtime": "",
            "release_dates": {"theater": "2011-11-11"},
            "ratings": {
              "critics_score": -1,
              "audience_score": 90
            },
            "synopsis": "",
            "posters": {
              "thumbnail": "http://content8.flixster.com/movie/11/16/39/11163966_tmb.jpg",
              "profile": "http://content8.flixster.com/movie/11/16/39/11163966_tmb.jpg",
              "detailed": "http://content8.flixster.com/movie/11/16/39/11163966_tmb.jpg",
              "original": "http://content8.flixster.com/movie/11/16/39/11163966_tmb.jpg"

            },
            "abridged_cast": [
              {
                "name": "Al Pacino",
                "characters": []
              },
              {
                "name": "Adam Sandler",
                "characters": []
              },
              {
                "name": "Katie Holmes",
                "characters": []
              }
            ],
            "links": {
              "self": "http://api.rottentomatoes.com/api/public/v1.0/movies/771205893.json",
              "alternate": "http://www.rottentomatoes.com/m/jack_and_jill_2011/"

            }
          },
          {
    "id": "770739679",
    "title": "Captain America: The First Avenger",
    "year": 2011,
    "mpaa_rating": "PG-13",
    "runtime": 121,
    "critics_consensus": "With plenty of pulpy action, a pleasantly retro vibe, and a handful of fine performances, Captain America is solidly old-fashioned blockbuster entertainment.",
    "release_dates": {"theater": "2011-07-22"},
    "ratings": {
      "critics_rating": "Fresh",
      "critics_score": 71,
      "audience_score": 96
    },
    "synopsis": "Captain America: The First Avenger will focus on the early days of the Marvel Universe when Steve Rogers (Chris Evans) volunteers to participate in an experimental program that turns him into the Super Soldier known as Captain America. As Captain America, Rogers joins forces with Bucky Barnes (Sebastian Stan) and Peggy Carter (Hayley Atwell) to wage war on the evil HYDRA organization, led by the villainous Red Skull (Hugo Weaving.) -- (C) Paramount",
    "posters": {
      "thumbnail": "http://content9.flixster.com/movie/11/15/83/11158339_tmb.jpg",
      "profile": "http://content9.flixster.com/movie/11/15/83/11158339_tmb.jpg",
      "detailed": "http://content9.flixster.com/movie/11/15/83/11158339_tmb.jpg",
      "original": "http://content9.flixster.com/movie/11/15/83/11158339_tmb.jpg"
    },
    "abridged_cast": [
      {
        "name": "Chris Evans",
        "characters": [
          "Captain America/Steve Rogers",
          "Steve Rogers / Captain America",
          "Steve Rogers/Captain America"
        ]
      },
      {
        "name": "Hayley Atwell",
        "characters": ["Peggy Carter"]
      },
      {
        "name": "Sebastian Stan",
        "characters": [
          "Bucky Barnes",
          "James Buchanan \"Bucky\" Barnes"
        ]
      },
      {
        "name": "Tommy Lee Jones",
        "characters": ["Colonel Chester Phillips"]
      },
      {
        "name": "Hugo Weaving",
        "characters": [
          "Johann Schmidt/Red Skull",
          "Johann Schmidt/The Red Skull",
          "Red Skull"
        ]
      }
    ],
    "links": {
      "self": "http://api.rottentomatoes.com/api/public/v1.0/movies/770739679.json",
      "alternate": "http://www.rottentomatoes.com/m/captain-america/",
      "cast": "http://api.rottentomatoes.com/api/public/v1.0/movies/770739679/cast.json",
      "clips": "http://api.rottentomatoes.com/api/public/v1.0/movies/770739679/clips.json",
      "reviews": "http://api.rottentomatoes.com/api/public/v1.0/movies/770739679/reviews.json",
      "similar": "http://api.rottentomatoes.com/api/public/v1.0/movies/770739679/similar.json"
    }
  }
      ]),
    });
  },

  hasMore: function(): boolean {
    var query = this.state.filter;
    if (!resultsCache.dataForQuery[query]) {
      return true;
    }
    return (
      resultsCache.totalForQuery[query] !==
      resultsCache.dataForQuery[query].length
    );
  },

  onEndReached: function() {
    var query = this.state.filter;
    if (!this.hasMore() || this.state.isLoadingTail) {
      // We're already fetching or have all the elements so noop
      return;
    }

    if (LOADING[query]) {
      return;
    }

    LOADING[query] = true;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: true,
    });

    var page = resultsCache.nextPageNumberForQuery[query];
    invariant(page != null, 'Next page number for "%s" is missing', query);
    fetch(this._urlForQueryAndPage(query, page))
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
        LOADING[query] = false;
        this.setState({
          isLoadingTail: false,
        });
      })
      .then((responseData) => {
        var moviesForQuery = resultsCache.dataForQuery[query].slice();

        LOADING[query] = false;
        // We reached the end of the list before the expected number of results
        if (!responseData.movies) {
          resultsCache.totalForQuery[query] = moviesForQuery.length;
        } else {
          for (var i in responseData.movies) {
            moviesForQuery.push(responseData.movies[i]);
          }
          resultsCache.dataForQuery[query] = moviesForQuery;
          resultsCache.nextPageNumberForQuery[query] += 1;
        }

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoadingTail: false,
          dataSource: this.getDataSource(resultsCache.dataForQuery[query]),
        });
      })
      .done();
  },

  getDataSource: function(movies: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(movies);
  },

  selectMovie: function(movie: Object) {
    if (Platform.OS === 'ios') {
      this.props.navigator.push({
        title: movie.title,
        component: MovieScreen,
        passProps: {movie},
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: movie.title,
        name: 'movie',
        movie: movie,
      });
    }
  },

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.searchMovies(filter), 100);
  },

  renderFooter: function() {
    if (!this.hasMore() || !this.state.isLoadingTail) {
      return <View style={styles.scrollSpinner} />;
    }

    return <ActivityIndicator style={styles.scrollSpinner} />;
  },

  renderSeparator: function(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={'SEP_' + sectionID + '_' + rowID}  style={style}/>
    );
  },

  renderRow: function(
    movie: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <MovieCell
        key={movie.id}
        onSelect={() => this.selectMovie(movie)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        movie={movie}
      />
    );
  },

  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <NoMovies
        filter={this.state.filter}
        isLoading={this.state.isLoading}
      /> :
      <ListView
        ref="listview"
        renderSeparator={this.renderSeparator}
        dataSource={this.state.dataSource}
        renderFooter={this.renderFooter}
        renderRow={this.renderRow}
        onEndReached={this.onEndReached}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false}
      />;

    return (
      <View style={styles.container}>
        <SearchBar
          onSearchChange={this.onSearchChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
        />
        <View style={styles.separator} />
        {content}
      </View>
    );
  },
});

class NoMovies extends React.Component {
  render() {
    var text = '';
    if (this.props.filter) {
      text = `No results for "${this.props.filter}"`;
    } else if (!this.props.isLoading) {
      // If we're looking at the latest movies, aren't currently loading, and
      // still have no results, show a message
      text = 'No movies found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noMoviesText}>{text}</Text>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerText: {
    alignItems: 'center',
  },
  noMoviesText: {
    marginTop: 80,
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
});

module.exports = SearchScreen;
