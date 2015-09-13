<?php

/**
 * This file is part of the Inely project.
 *
 * (c) Inely <http://github.com/inely>
 *
 * @author rootkit
 */

namespace backend\controllers;

use Yii;
use backend\models\search\TimelineEventSearch;
use yii\web\Controller;

/**
 * Application timeline controller
 */
class TimelineEventController extends Controller
{
    public $layout = 'common';

    /**
     * Lists all TimelineEvent models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel        = new TimelineEventSearch();
        $dataProvider       = $searchModel->search(Yii::$app->request->queryParams);
        $dataProvider->sort = [
            'defaultOrder' => [ 'created_at' => SORT_DESC ]
        ];

        return $this->render('index', [
            'searchModel'  => $searchModel,
            'dataProvider' => $dataProvider
        ]);
    }
}
