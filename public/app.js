//vue instance for html
const app = new Vue({
	el: '#app',
	data: {
		id: '',
		url: '',
		data: null,
		message: null
	},
	methods: {
		//createUrl function for posting url and supplied slug to backend
		async createUrl() {

			// console.log(this.id, this.url);
			const res = await fetch(`/create`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id: this.id ? this.id : '',
					url: this.url
				})
			});

			//receive response and display
			this.data = await res.json();
			this.message = {
				message: this.data['message'],
			};
		}
	}
});