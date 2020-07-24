const app = new Vue({
	el: '#app',
	data: {
		id: '',
		url: '',
		data: null,
		message: null
	},
	methods: {
		async createUrl() {

			console.log(this.id, this.url);

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


			this.data = await res.json();
			this.message = {
				message: this.data['message']
			}
		}
	}
})