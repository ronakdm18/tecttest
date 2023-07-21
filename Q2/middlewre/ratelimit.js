// Create a Map to store rate limit data for different namespaces and client IPs
const rateMap = new Map();

// Define the rateLimit function that returns a middleware function
function rateLimit(namespace, maxReq, timeApply) {
    return (req, res, next) => {
        // Create a unique key for the namespace and client IP
        const key = `${namespace}_${req.ip}`;

        // Get the current timestamp in milliseconds
        const currentTime = Date.now();

        // Check if the key exists in the rateMap
        if (!rateMap.has(key)) {
            // If the key doesn't exist, it means this is the first request for this namespace and IP
            // Create an entry in the rateMap with initial count and lastRequestTime
            rateMap.set(key, { count: 1, lastRequestTime: currentTime });
        } else {
            // If the key exists, it means there have been previous requests for this namespace and IP
            // Get the count and lastRequestTime from the rateMap
            const { count, lastRequestTime } = rateMap.get(key);

            // Check if the time difference between the current request and the last request is within the rate limit time period
            if (currentTime - lastRequestTime < timeApply * 60 * 1000) {
                // If the time difference is within the rate limit time period, check if the request count exceeds the maximum allowed requests
                if (count >= maxReq) {
                    // If the request count exceeds the limit, calculate the remaining time for the rate limit to reset
                    const waitTime = Math.ceil((lastRequestTime + timeApply * 60 * 1000 - currentTime) / 1000 / 60);

                    // Send a 429 (Too Many Requests) HTTP status code with an error message
                    const message = `Too many requests for the ${namespace} namespace. Please retry in ${waitTime} minutes`;
                    return res.status(429).send({
                        success: false,
                        message: message
                    });
                }

                // If the request count is within the limit, update the rateMap with an increased count and the current timestamp
                rateMap.set(key, { count: count + 1, lastRequestTime: currentTime });
            } else {
                // If the time difference is greater than the rate limit time period, reset the count and update the lastRequestTime
                rateMap.set(key, { count: 1, lastRequestTime: currentTime });
            }
        }

        // Continue to the next middleware or route handler
        next();
    };
}

module.exports = { rateLimit }