import qs from "qs";
import axios from "axios";

export default async function validateErpCredentials(username, password, college) {
    const body = qs.stringify({ username, password });

    let response;

    if(college == "PSIT"){
        try {
        response = await axios.post(process.env.ERP_AUTH_URL, body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (compatible; PSIT-Unofficial/1.0)",
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
            timeout: 20000,
        });
    } catch (err) {
        if (err.response) {
            response = err.response;
        } else {
            throw err;
        }
    }
    }
    if(college == "PSIT-CHE"){
        try {
        response = await axios.post(process.env.CHE_ERP_AUTH_URL, body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (compatible; PSIT-Unofficial/1.0)",
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
            timeout: 20000,
        });
    } catch (err) {
        if (err.response) {
            response = err.response;
        } else {
            throw err;
        }
    }
    }

    

    if (!response) {
        return {
            success: false,
            role: "unknown",
            erpRedirect: "",
            erpCookie: null,
        };
    }


    const location = response.headers?.location || "";
    const setCookie = response.headers?.["set-cookie"] || [];

    const ciSession =
        setCookie
            .find(cookie => cookie.startsWith("ci_session="))
            ?.split(";")[0] || null;

    const lower = location.toLowerCase();

    let role = "unknown";

    if (lower.includes("/student/")) {
        role = "student";
    } else if (lower.includes("/admin/")) {
        role = "admin";
    } else if (lower.includes("/faculty/")) {
        role = "faculty";
    } else if (lower.includes("/employee/")) {
        role = "employee";
    }

    const success = role !== "unknown";

   
    return {
        success,
        role,
        erpRedirect: location,
        erpCookie: ciSession,
    };
}