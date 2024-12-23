export class JsonUtils {
    /**
     * Convert a JSON object to a string.
     * @param jsonObject - The JSON object to convert.
     * @returns A string representation of the JSON object.
     */
    static jsonToString(jsonObject: Record<string, any>): string {
        try {
            return JSON.stringify(jsonObject);
        } catch (error) {
            throw new Error('Failed to convert JSON to string: ' + error.message);
        }
    }

    /**
     * Convert a string to a JSON object.
     * @param jsonString - The string to convert.
     * @returns A JSON object.
     */
    static stringToJson(jsonString: string): Record<string, any> {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error('Failed to convert string to JSON: ' + error.message);
        }
    }
}
