// components/Footer.js
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full text-white text-center fixed bottom-0 left-0">
      <ul className="example-1">
        <li className="icon-content">
          <a
            href="https://www.facebook.com/ukshati/"
            className="link"
            data-social="facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="text-2xl" />
            <span className="tooltip">Facebook</span>
          </a>
        </li>
        <li className="icon-content">
          <a
            href="https://www.instagram.com/ukshati/"
            className="link"
            data-social="instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-2xl" />
            <span className="tooltip">Instagram</span>
          </a>
        </li>
        <li className="icon-content">
          <a
            href="https://www.linkedin.com/company/ukshati-technologies/"
            className="link"
            data-social="linkedin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="text-2xl" />
            <span className="tooltip">LinkedIn</span>
          </a>
        </li>
        <li className="icon-content">
          <a
            href="https://twitter.com/ukshati/"
            className="link"
            data-social="twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter className="text-2xl" />
            <span className="tooltip">Twitter</span>
          </a>
        </li>
      </ul>
      <p className="text-sm mt-4">Contact: +91 7259439998 | Email: ukshati365@gmail.com</p>

      <style jsx global>{`
        /* Updated Footer Styles */
        .example-1 {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #000;
          border-radius: 30px;
          padding: 10px;
          height: 60px;
          width: 300px;
          margin: 0 auto;
        }

        .icon-content {
          margin: 0 10px;
          position: relative;
        }

        .tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #fff;
          color: #000;
          padding: 6px 10px;
          border-radius: 5px;
          opacity: 0;
          visibility: hidden;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .icon-content:hover .tooltip {
          opacity: 1;
          visibility: visible;
          top: -50px;
        }

        .link {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: #fff;
          background-color: #000;
          transition: all 0.3s ease-in-out;
        }

        .link:hover {
          box-shadow: 3px 2px 45px 0px rgba(0, 0, 0, 0.12);
        }

        .link[data-social="facebook"]:hover {
          color: #1877f2;
        }
        .link[data-social="instagram"]:hover {
          color: #e4405f;
        }
        .link[data-social="linkedin"]:hover {
          color: #0a66c2;
        }
        .link[data-social="twitter"]:hover {
          color: #1da1f2;
        }
      `}</style>
    </footer>
  );
};

export default Footer;