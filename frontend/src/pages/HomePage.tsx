import { Link } from "react-router-dom";
import { games } from "../games/registry";
import { useI18n } from "../i18n/I18nContext";
import { Clomo } from "../mascot/Clomo";
import "./home.css";

export function HomePage() {
  const { t } = useI18n();

  return (
    <div className="home-page">
      <div className="home-header">
        <Clomo pose="ordinateur" height={200} className="home-clomo" />
        <div className="home-headings">
          <h1>{t("home.title")}</h1>
          <p className="home-subtitle">{t("home.subtitle")}</p>
        </div>
      </div>
      <div className="game-cards">
        {games.map((game) => (
          <Link key={game.id} to={game.path} className="game-card">
            <span className="game-card-icon">
              <game.Icon />
            </span>
            <span className="game-card-title">{t(game.titleKey)}</span>
            <span className="game-card-description">{t(game.descriptionKey)}</span>
            <span className="game-card-play">{t("home.play")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
