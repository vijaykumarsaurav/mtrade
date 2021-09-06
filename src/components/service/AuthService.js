class AuthService {

    getLoggedInUserInfo() {
        localStorage.getItem("UserInfo");
    }

    getHeader() {


        var tokens = JSON.parse(localStorage.getItem("userTokens")); 
        var jwtToken =   tokens &&  tokens.jwtToken;

        return { 'headers': {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type':'application/json', 
            'Accept':'application/json', 
            'X-UserType':'USER',
            'X-SourceID':'WEB',
            'X-ClientLocalIP':'192.168.1.128',
            'X-ClientPublicIP':'91.0.4472.114',
            'X-MACAddress':'f0:18:98:26:c4:cc',
            'X-PrivateKey':'I4O6PJAn'
        } }
    }

    loginHeader() {
        return { 'headers': {
            'Content-Type':'application/json', 
            'Accept':'application/json', 
            'X-UserType':'USER',
            'X-SourceID':'WEB',
            'X-ClientLocalIP':'192.168.1.128',
            'X-ClientPublicIP':'91.0.4472.114',
            'X-MACAddress':'f0:18:98:26:c4:cc',
            'X-PrivateKey':'I4O6PJAn'
        } }
    }
    getImageHeader() {
        return { 'headers': {'token': localStorage.getItem("token")}}
    }

    getScannerHeader() {
        return { 'headers': {
            'Content-Type':'application/json', 
            'Accept':'application/json',
      //      'Access-Control-Allow-Headers': "x-csrf-token",
       //     'x-csrf-token':'dWsWEZqGaGd6RfARb33LKjPDdyuGUUrgi8Z4qvsB' 
            // 'sec-fetch-mode': 'cors',
            // 'origin': 'localhost',

            
        } }
    }

    getNSESessionHeader(sessionId) {
        return { 'headers': {
            'sessionId': sessionId, 
            'Accept':'application/json',
      //      'Access-Control-Allow-Headers': "x-csrf-token",
       //     'x-csrf-token':'dWsWEZqGaGd6RfARb33LKjPDdyuGUUrgi8Z4qvsB' 
            // 'sec-fetch-mode': 'cors',
            // 'origin': 'localhost',

            
        } }
    }

}

export default new AuthService();