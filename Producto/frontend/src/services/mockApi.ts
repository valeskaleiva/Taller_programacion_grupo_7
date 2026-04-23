// Mock API service for testing and development without backend 

class MockApi {
    constructor() {
        this.data = {};
    }

    getData(endpoint) {
        return this.data[endpoint] || null;
    }

    setData(endpoint, data) {
        this.data[endpoint] = data;
    }

    clearData(endpoint) {
        delete this.data[endpoint];
    }
}

export default new MockApi();