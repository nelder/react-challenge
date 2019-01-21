const e = React.createElement;
var databaseObject = [];

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			searchResults: [],
			data: []
		};

		this.handleSearch = this.handleSearch.bind(this);
		this.getFavorites = this.getFavorites.bind(this);
	}

	componentWillMount(){
		this.getFavorites()
	}

	handleSearch(res) {
		this.setState({searchResults: res});
	}

	getFavorites(){

		var list = [];

		for (var i = 0; i < localStorage.length; i++){

			var value = ""

			if(localStorage.getItem(localStorage.key(i)) != "0" && localStorage.getItem(localStorage.key(i)) != null){
				const parser = new DOMParser();
				var decodedString = (parser.parseFromString(localStorage.getItem(localStorage.key(i)), 'text/html').body.textContent);

				var generatedElement = <div dangerouslySetInnerHTML={{__html: decodedString}}></div>

				list.push(<SearchResult callback={this.getFavorites} title={localStorage.key(i)} desc={generatedElement} />)		
			}

		}
		this.setState({data: list});
	}

	render() {
		return (
			<div>
				<div id="pageHeading">
					<h1>Toronto Waste Lookup</h1>
				</div>

				<SearchBar callback={this.handleSearch}/>

				<SearchResults callback={this.getFavorites} resultsObject={this.state.searchResults}/>

				<Favorites favorites={this.state.data}/>

			</div>
		);
	}
}

class SearchBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			queryString : ""
		};

		//bindings
		this.executeSearch = this.executeSearch.bind(this);
		this.handleTyping = this.handleTyping.bind(this);
		this.handleText = this.handleText.bind(this);

	}

	componentWillMount(){		
		//Fetch DB File
		fetch('./data.json').then(function(response) { 
			// Convert to JSON
			return response.json();
		}).then(function(j) {
			// Yay, `j` is a JavaScript object
			databaseObject = j; 
		});
	}

	executeSearch() {
		var results = databaseObject.filter(o => o.keywords.includes(this.state.queryString.toLowerCase()));
		this.props.callback(results);
	}

	handleTyping(e){
		if (e.key === 'Enter') {
			this.executeSearch();
		}
    }

    handleText(e){
    	this.setState({queryString : e.target.value});
    	if(e.target.value === ""){
    		this.props.callback([]);
    	}
    }

	render() {
		return (
			<div id="searchBar">
				<div id="queryContainerOffset">
					<input id="searchQuery" onKeyPress={this.handleTyping} onChange={this.handleText} type="text" name="searchQuery" placeholder="Enter a search ..." />
				</div>
				<span id="searchButton" onClick={this.executeSearch}><div style={{paddingLeft: "6px"}}><i class="fas fa-search fa-flip-horizontal searchIcon"></i></div></span>
			</div>
		);
	}

}


class SearchResults extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			
		};
		this.getResults = this.getResults.bind(this);

	}

	getResults(data){

		var list = [];
		for (var value of data) {
			const parser = new DOMParser();
			var decodedString = (parser.parseFromString(value.body, 'text/html').body.textContent);

			var generatedElement = <div dangerouslySetInnerHTML={{__html: decodedString}}></div>
			list.push(<SearchResult callback={this.props.callback} title={value.title} desc={generatedElement} raw={value.body}/>)
		}

		return list;
	}

	render() {
		
		return (
			<div id="searchResultsContainer">
				{this.getResults(this.props.resultsObject)}
			</div>	
		);
	}

}


class SearchResult extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			starType: localStorage.getItem(this.props.title) != "0" && localStorage.getItem(this.props.title) != null ? "greenStar" : "greyStar"
		};
		this.starClick = this.starClick.bind(this);

	}

	starClick(){
		var favData = localStorage.getItem(this.props.title)
		
		//If never favorited or not current favorite but past -> FAVE IT
		if(favData == null || favData === "0"){

			//Update DB 
			localStorage.setItem(this.props.title, this.props.raw)

			//Update DOM
			this.setState({starType : "greenStar"})

		}
		//Remove Fav
		else{

			//Update DB 
			localStorage.setItem(this.props.title, "0")

			//Update DOM
			this.setState({starType : "greyStar"})

		}

		this.props.callback()

	}

	render() {
		return (
			<div class="searchResult">
				<div class="searchResultInner">
					<div onClick={this.starClick} class="star">
						<i class={"fas fa-star " +this.state.starType}></i>
					</div>
					<div class="title">
						{this.props.title} 
					</div>
					<div class="spacer">
					</div>
					<div class="desc">
						{this.props.desc} 
					</div>
				</div>
			</div>
		);
	}

}


class Favorites extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: []
		};
	}

	render() {

		return (
			<div id="favorites">
				<h3 id="favoritesTitle">Favorites</h3>
				<div id="favoritesContainer">
					{this.props.favorites}
				</div>
			</div>
		);
	}

}

const domContainer = document.querySelector('#root');
ReactDOM.render(e(App), domContainer);