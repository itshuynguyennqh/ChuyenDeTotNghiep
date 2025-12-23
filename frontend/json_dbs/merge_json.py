import json
import os
import glob

def merge_json_files():
    # Directory containing the json files
    source_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(source_dir, 'db.json')
    
    merged_data = {}
    
    # Pattern to match json files
    json_files = glob.glob(os.path.join(source_dir, '*.json'))
    
    print(f"Found {len(json_files)} JSON files.")
    
    for file_path in json_files:
        # Skip the output file if it already exists and is in the list
        if os.path.basename(file_path) == 'db.json':
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Assuming each file contains a dictionary with one or more keys
                # We merge them into the main dictionary
                if isinstance(data, dict):
                    merged_data.update(data)
                else:
                    print(f"Warning: {file_path} does not contain a JSON object (dict). Skipped.")
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=4, ensure_ascii=False)
        print(f"Successfully merged files into {output_file}")
    except Exception as e:
        print(f"Error writing to {output_file}: {e}")

if __name__ == "__main__":
    merge_json_files()
