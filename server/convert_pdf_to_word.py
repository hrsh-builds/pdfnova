from pdf2docx import Converter
import sys
import os

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 convert_pdf_to_word.py input.pdf output.docx")
        sys.exit(1)

    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]

    if not os.path.exists(input_pdf):
        print("Input PDF not found")
        sys.exit(1)

    cv = None
    try:
        cv = Converter(input_pdf)
        cv.convert(output_docx, start=0, end=None)
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)
    finally:
        if cv:
            cv.close()

if __name__ == "__main__":
    main()