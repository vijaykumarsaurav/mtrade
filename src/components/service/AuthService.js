class AuthService {

    getLoggedInUserInfo() {
        localStorage.getItem("UserInfo");
    }

    getHeader() {
        return { 'headers': {'Authorization': 'Bearer ' + localStorage.getItem("token") } }
        //return { 'headers': { 'X-Server-Key': '8786gfhy' } }
    }

    // logout() {

    //     if(window.localStorage.getItem("token")){
    //       localStorage.clear();
    //       this.props.history.push("/login");
    //     }
    //     console.log("logout");
    // }
}

export default new AuthService();